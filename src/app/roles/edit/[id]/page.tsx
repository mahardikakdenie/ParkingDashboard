"use client";

import React from "react";
import RoleFormView from "@/views/roles/RoleFormView";

export default function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = React.use(params as Promise<{ id: string }>);
  return <RoleFormView mode="edit" roleId={resolvedParams.id} />;
}
