import { routes } from "@/config/routes";
export const navigationGroups=[
{label:"Operations",items:[{label:"Overview",href:routes.overview},{label:"Assets",href:routes.assets},{label:"Digital twins",href:routes.digitalTwins},{label:"GIS map",href:routes.map},{label:"Alerts",href:routes.alerts},{label:"Incidents",href:routes.incidents}]},
{label:"Markets",items:[{label:"Carbon registry",href:routes.carbon},{label:"Treasury",href:routes.treasury}]},
{label:"Platform",items:[{label:"Integrations",href:routes.integrations},{label:"Plugins",href:routes.plugins},{label:"Administration",href:routes.admin}]}
];
