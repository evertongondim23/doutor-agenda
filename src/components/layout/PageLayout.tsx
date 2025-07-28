import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  user?: {
    name: string;
    email: string;
  };
  onLogout?: () => void;
  headerAction?: React.ReactNode;
}

export default function PageLayout({
  children,
  title,
  description,
  user,
  onLogout,
  headerAction,
}: PageLayoutProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm text-gray-500">
                Menu Principal &gt; {title}
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {headerAction}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              {onLogout && (
                <Button onClick={onLogout} variant="outline" size="sm">
                  Sair
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
