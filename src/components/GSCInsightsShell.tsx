import type { AdminViewServerProps } from "payload";
import { DefaultTemplate } from "@payloadcms/next/templates";
import React from "react";

import { GSCInsightsView } from "./GSCInsightsView";

// Custom route views render standalone in Payload unless wrapped in
// DefaultTemplate, which provides the admin shell (left nav, actions).
export function GSCInsightsShell(props: AdminViewServerProps) {
  const { initPageResult } = props;
  const { req } = initPageResult;

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={props.params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      req={req}
      searchParams={props.searchParams}
      user={req.user ?? undefined}
      viewActions={props.viewActions}
      viewType={props.viewType}
      visibleEntities={initPageResult.visibleEntities}
    >
      <GSCInsightsView />
    </DefaultTemplate>
  );
}
