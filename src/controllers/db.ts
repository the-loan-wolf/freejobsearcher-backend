// He Haven't add security checks yet!
// right now anyone can access as much feed data as much they want
// we have to check if a user is signed in or not and then allow
// more than 5 feed data!

import { RouteHandler } from "@hono/zod-openapi";
import { parseFirestoreFields } from "../lib/firestore-helper";
import { userFeedRoute } from "../routes/db";
import { AppEnv, FirestoreDocument } from "../lib/types";

export const feedHandler: RouteHandler<
  typeof userFeedRoute,
  { Bindings: AppEnv }
> = async (c) => {
  const token = c.req.header("Authorization");
  const { limit, country, search } = c.req.valid("query");

  // Default: 5 users for public requests
  const maxLimit = token ? parseInt(limit || "20") : 5;

  // Build Firestore query (using REST API)
  const projectId = c.env.FIREBASE_PROJECT_ID;

  type FirestoreFilter =
    | {
        fieldFilter: {
          field: { fieldPath: string };
          op: string;
          value: { stringValue: string };
        };
      }
    | {
        compositeFilter: {
          op: "AND" | "OR";
          filters: FirestoreFilter[];
        };
      };

  interface FirestoreQueryBody {
    structuredQuery: {
      from: { collectionId: string }[];
      limit: number;
      where?: FirestoreFilter;
    };
  }

  const filters: FirestoreFilter[] = [];

  // Optional filters
  if (country) {
    filters.push({
      fieldFilter: {
        field: { fieldPath: "country" },
        op: "EQUAL",
        value: { stringValue: country },
      },
    });
  }

  if (search) {
    filters.push({
      fieldFilter: {
        field: { fieldPath: "name" },
        op: "GREATER_THAN_OR_EQUAL",
        value: { stringValue: search },
      },
    });
  }

  // Build query safely
  const queryBody: FirestoreQueryBody = {
    structuredQuery: {
      from: [{ collectionId: "resumes" }],
      limit: maxLimit,
      ...(filters.length > 0
        ? {
            where:
              filters.length === 1
                ? filters[0]
                : { compositeFilter: { op: "AND", filters } },
          }
        : {}),
    },
  };

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(queryBody),
    });

    // DOCS:
    // console.log(JSON.stringify(queryBody))
    // example output:
    // {
    //   structuredQuery: {
    //     from: [{ collectionId: "resumes" }],
    //     limit: 5,
    //     where: {
    //       compositeFilter: {
    //         op: "AND",
    //         filters: [
    //           {
    //             fieldFilter: {
    //               field: { fieldPath: "country" },
    //               op: "EQUAL",
    //               value: { stringValue: "US" },
    //             },
    //           },
    //           {
    //             fieldFilter: {
    //               field: { fieldPath: "name" },
    //               op: "GREATER_THAN_OR_EQUAL",
    //               value: { stringValue: "alice" },
    //             },
    //           },
    //         ],
    //       },
    //     },
    //   },
    // };

    if (!res.ok) {
      const errorBody = await res.clone().text();
      console.error("Error:", {
        status: res.status,
        statusText: res.statusText,
        body: errorBody,
      });
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    const data: FirestoreDocument = await res.json();

    const resumes = data
      .filter((r) => r.document) // skip empty rows
      .map((r) => {
        const doc = r.document;
        const data = parseFirestoreFields(doc.fields) || {};
        const profile = data.profile || {};

        return {
          id: doc.name.split("/").pop(),
          name: profile.name || "Unknown",
          role: profile.role || "",
          location: profile.location || "",
          salary: profile.salary || "",
          image: profile.image || "",
          experience: profile.experience || "",
          bio: profile.bio || "",
          skills: data.skills || [],
        };
      });

    return c.json(resumes);
  } catch (error) {
    console.log(error);
    return c.json({ error: (error as Error).message }, 500);
  }
};
