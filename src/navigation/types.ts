// src/navigation/types.ts
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  BookDetails: { bookId: string }; // Halimbawa ng screen na may parameter
};
