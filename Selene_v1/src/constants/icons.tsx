import { Feather } from "@expo/vector-icons";

export const icon = {
    homeScreen: (props: any) => <Feather name="home" size={22} {...props} />,
    taskScreen: (props: any) => <Feather name="check-square" size={22} {...props} />,
    journalScreen: (props: any) => <Feather name="book" size={22} {...props} />,
    mediaScreen: (props: any) => <Feather name="image" size={22} {...props} />,
    default: (props: any) => <Feather name="help-circle" size={22} {...props} />,
};
export default icon;
