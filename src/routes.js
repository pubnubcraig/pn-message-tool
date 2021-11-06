import KeySet from "tools/KeySet";
import ToolboxApp from "tools/ToolboxApp";

// @mui/icons-material
import { VpnKey } from "@mui/icons-material";

// app routes
import routesPushDebug from "tools/PushDebug/routesPushDebug";
import routesAuthAdmin from "tools/AuthAdmin/routesAuthAdmin"
import routesObjectAdmin from "tools/ObjectAdmin/routesObjectAdmin";

var routes = [
  {
    path: "/key-set",
    name: "Key Set",
    icon: VpnKey,
    iconColor: "Error",
    component: KeySet,
    layout: "/admin",
    parent: ToolboxApp,
    index: 0,
  },
  {
    divider: true,
  },
  routesPushDebug,
  {
    divider: true,
  },
  routesAuthAdmin,
  {
    divider: true,
  },
  routesObjectAdmin,
  {
    divider: true,
  },
  // {
  //   title: "Documentation",
  // },
  // {
  //   href:
  //     "https://www.creative-tim.com/learning-lab/material-ui/overview/argon-dashboard?ref=admui-admin-sidebar",
  //   name: "Getting started",
  //   icon: Bolt,
  // },
];

export default routes;
