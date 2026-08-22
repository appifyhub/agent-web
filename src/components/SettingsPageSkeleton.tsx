import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SettingsPageSkeleton: React.FC = () => (
  <div className="flex w-full flex-col items-start gap-4">
    <Skeleton className="h-10 w-full sm:w-md" />
    <Skeleton className="h-20 w-full sm:w-md" />
    <Skeleton className="h-10 w-full sm:w-md" />
    <Skeleton className="h-20 w-full sm:w-md" />
  </div>
);

export default SettingsPageSkeleton;
