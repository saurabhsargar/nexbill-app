import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { routeAccessMap } from "@/config/route-access";
import { Role } from "@/types/auth";

export function useRoleGuard(userRole?: Role) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // ⛔ Don’t run guard until role is known
        if (!userRole) return;

        const allowedRoles = routeAccessMap[pathname];

        if (allowedRoles && !allowedRoles.includes(userRole)) {
            router.replace("/403");
        }
    }, [pathname, userRole, router]);
}
