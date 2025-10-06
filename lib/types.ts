export type ItemRow = {
  id: string;
  name: string;
  sale_price: number;
  cost_price: number;
};

export type CategoryRow = {
  id: string;
  name: string;
  parent_id: string | null;
  pos: number;
};

export type CouponRow = {
  code: string;
  percent_off: number;
  max_uses: number;
  used: number;
  valid_from: string;
  valid_to: string;
  active: boolean;
};

export type MemberRow = {
  phone: string;
  name: string | null;
  points: number;
  tier: string;
};