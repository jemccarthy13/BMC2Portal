import React from "react";

class Category {
	name: string;
	icon?: JSX.Element;
	link?: string;
	children?: Category[];

	constructor(name: string, icon?: JSX.Element, link?: string, children?: Category[]) {
		this.name = name;
		this.icon = icon;
		this.link = link;
		this.children = children;
	}
}

export default Category;
