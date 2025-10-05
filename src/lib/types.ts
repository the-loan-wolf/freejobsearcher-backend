export type FirestoreDocument = Array<{
  document: {
    name: string;
    fields: { [key: string]: any };
    createTime: string;
    updateTime: string;
  };
  readTime: string;
}>;

export type AppEnv = {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY: string;
};
