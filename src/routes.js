import KeySet from "tools/KeySet";
import ToolboxApp from "tools/ToolboxApp";

// @mui/icons-material
import { VpnKey } from "@mui/icons-material";

// tool routes
import routesSwissArmy from "tools/SwissArmy/routesSwissArmy";

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
  
  {divider: true,},
  routesSwissArmy,
];

export default routes;
