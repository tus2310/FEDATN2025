export interface Icategory {
  _id: string;
  name: string;
}
export type IcategoryLite = Pick<Icategory, "name">;
