import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Blocks } from "lucide-react";

export default function IntegrationListCard({ data = [] }) {
  const { t } = useTranslation();

  return (
    <Card className="lg:col-span-2 border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Blocks className="w-5 h-5" />
          {t("dashboard.listOfIntegration")}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-nexus-primary h-8 font-medium hover:text-nexus-primary/80 hover:bg-transparent px-0"
        >
          {t("dashboard.seeAll")}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                <th className="pb-4 w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-nexus-primary focus:ring-nexus-primary/20"
                  />
                </th>
                <th className="pb-4 pl-2">
                  {t("dashboard.integrationAddon")}
                </th>
                <th className="pb-4">{t("dashboard.integrationType")}</th>
                <th className="pb-4">{t("dashboard.integrationRate")}</th>
                <th className="pb-4 text-right pr-2">
                  {t("dashboard.integrationProfit")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm"
                  >
                    {t("dashboard.noIntegrations")}
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-nexus-primary focus:ring-nexus-primary/20"
                      />
                    </td>
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <Blocks className="w-5 h-5 text-nexus-primary" />
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-500 text-sm">{item.type}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3 w-40">
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-nexus-primary rounded-full"
                            style={{ width: item.rate, backgroundColor: "#5347CE" }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500">{item.rate}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right font-bold text-gray-900 dark:text-white pr-2 text-sm">
                      {item.profit}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
