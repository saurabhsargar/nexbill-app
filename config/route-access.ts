import { Role } from "@/types/auth";

export const routeAccessMap: Record<string, Role[]> = {
  "/dashboard": ["ADMIN", "MANAGER"],
  "/billing": ["ADMIN", "MANAGER", "CASHIER"],
  "/inventory": ["ADMIN", "MANAGER"],
  "/users": ["ADMIN"],
  "/reports": ["ADMIN", "MANAGER"],
  "/accounting": ["ADMIN"],
  "/utilities": ["ADMIN"],
  "/settings": ["ADMIN", "MANAGER"],
};