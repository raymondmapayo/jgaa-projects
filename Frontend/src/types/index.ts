export interface T_LoginPayload {
  email: string;
  password: string;
}

export interface T_LoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: {
    user_id: number;
    fname: string;
    lname: string;
    email: string;
    pnum: string;
    address: string;
    role: "admin" | "worker" | "client";
  };
}

export interface T_RegisterPayload {
  fname: string;
  lname: string;
  email: string;
  password: string;
  verification_token: string;
  confirmPassword: string;
  pnum: string;
  address: string;
  role?: "admin" | "worker" | "client"; // Optional
}

export interface T_User {
  user_id: number;
  fname: string;
  lname: string;
  email: string;
  pnum: string;
  address: string;
  role: "admin" | "worker" | "client";
  id_pic: string;
  profile_pic: string;
}
