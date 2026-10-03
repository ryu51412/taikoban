export type StoreStatus = "公開中" | "準備中" | "未発行";
export type StorePlan = "スタンダード" | "ライト";
export const STORE_STATUSES: StoreStatus[] = ["公開中", "準備中", "未発行"];
export const STORE_PLANS: StorePlan[] = ["スタンダード", "ライト"];

export type Store = {
  id: string;
  slug: string;
  name: string;
  mark: string | null;
  googleReviewUrl: string;
  aspects: string[]; // 決め手（3つ）
  menus: string[]; // おすすめメニュー（3つ）
  couponText: string | null;
  notifyEmail: string;
  status: StoreStatus;
  plan: StorePlan;
  notifyOn: boolean;
  couponOn: boolean;
  updatedAt: string; // ISO
};

/** お客様の口コミページに渡してよい項目だけ */
export type PublicStore = Pick<Store, "slug" | "name" | "googleReviewUrl" | "aspects" | "menus"> & {
  coupon: string | null;
};

export type StoreInput = {
  name: string;
  googleReviewUrl: string;
  aspects: string[];
  menus: string[];
  couponText: string | null;
  notifyEmail: string;
  notifyOn: boolean;
  couponOn: boolean;
  status: StoreStatus;
  plan: StorePlan;
};

export type EventType = "qr_open" | "star" | "aspect" | "menu" | "post_click" | "feedback_submit";
export const EVENT_TYPES: EventType[] = ["qr_open", "star", "aspect", "menu", "post_click", "feedback_submit"];

export type NewEvent = {
  storeId: string;
  sessionId: string;
  type: EventType;
  rating?: number | null;
  value?: string | null;
  createdAt?: string;
};

export type ResponseRoute = "google" | "form";

export type ReviewResponse = {
  id: string;
  storeId: string;
  sessionId: string;
  rating: number;
  route: ResponseRoute;
  tags: string[];
  text: string;
  done: boolean;
  createdAt: string;
};

export type NewResponse = Omit<ReviewResponse, "id" | "done" | "createdAt"> & { done?: boolean; createdAt?: string };

/** 1店舗ぶんの集計。すべて同じ events から計算する */
export type StoreStats = {
  storeId: string;
  taps: number; // 直近30日の QR 読み取り（セッション数）
  prevTaps: number; // その前の30日
  starred: number; // ★をタップしたセッション
  aspected: number; // 決め手を選んだセッション
  posted: number; // 投稿ボタンを押したセッション
  feedback: number; // ご意見フォームの送信
  ratings: number[]; // [★1, ★2, ★3, ★4, ★5]（セッションごとの最後の★）
  prevStarred: number;
  prevRatingSum: number;
  weekly: number[]; // 直近10週（古い順）
  hours: number[]; // [11–14, 14–17, 17–20, 20–23, その他]
};

export type Role = "owner" | "operator";
export type SessionUser = { id: string; email: string; role: Role; storeId: string | null };
