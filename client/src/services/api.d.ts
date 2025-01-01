declare module 'services/api' {
  export const getUsers: () => Promise<Array<{
    _id: string;
    name: string;
    email: string;
  }>>;
}
