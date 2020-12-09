import {SvgIconComponent} from "@material-ui/icons";

export default interface Category {
	id: string,
	icon: JSX.Element,
	link?: string,
	children?: Category[]
}