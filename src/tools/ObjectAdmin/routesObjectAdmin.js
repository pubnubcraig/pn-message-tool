// @mui/icons-material
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';

// app pages
import { ObjectAdminProvider } from "./ObjectAdminProvider";
import ChannelMetadata from './pages/ChannelMetadata';
import ChannelMetadataList from './pages/ChannelMetadataList';

var routesObjectAdmin = {
  collapse: true,
  name: "Object Admin",
  icon: SettingsEthernetIcon,
  iconColor: "Primary",
  state: "objectAdminCollapse",
  views: [
    {
      path: "/channel-metadata",
      name: "Channel Metadata",
      component: ChannelMetadata,
      parent: ObjectAdminProvider,
      layout: "/admin",
    },
    {
      path: "/channel-metadata-list",
      name: "Channel Metadata List",
      component: ChannelMetadataList,
      parent: ObjectAdminProvider,
      layout: "/admin",
    },
  ]
};

export default routesObjectAdmin;
