export interface IVoucher {
  _id?: string; // Optional for when the voucher is created
  code: string;
  discountAmount: number;
  expirationDate: Date;
  quantity: number;
  createdAt?: Date; // Optional as it will be auto-generated
}
