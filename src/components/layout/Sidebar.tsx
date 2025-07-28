import { Calendar, DollarSign, Stethoscope, Users } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  user?: {
    name: string;
    email: string;
  };
  onLogout?: () => void;
}

const menuItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: Calendar,
  },
  {
    path: "/agendamentos",
    label: "Agendamentos",
    icon: Calendar,
  },
  {
    path: "/medicos",
    label: "Médicos",
    icon: Stethoscope,
  },
  {
    path: "/pacientes",
    label: "Pacientes",
    icon: Users,
  },
  {
    path: "/planos",
    label: "Planos",
    icon: DollarSign,
  },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">dr</span>
          </div>
          <span className="font-semibold text-gray-900">agenda</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Menu Principal
          </h3>
          <div className="space-y-1">
            {menuItems.slice(0, 4).map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="mr-3 h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Outros
          </h3>
          {menuItems.slice(4).map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <IconComponent className="mr-3 h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
            <span className="text-xs font-medium">CC</span>
          </div>
          <div>
            <p className="font-medium">Clínica Care</p>
            <p className="text-xs">{user?.email || "mail@example.com"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
