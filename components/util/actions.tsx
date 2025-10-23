import Link from "next/link";
import * as React from "react";
import { tinaField } from "tinacms/dist/react";
import { IconPickerInput } from "../fields/icon";
import * as BoxIcons from "react-icons/bi";

export const IconOptions = {
  ...BoxIcons,
};

export const Actions = ({
  className = "",
  actions,
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-y-4 gap-x-6 ${className}`}>
      {actions &&
        actions.map((action, index) => {
          const IconSVG = action.icon && IconOptions[action.icon];
          // Add #page-top anchor to scroll to top on navigation
          const href = action.link ? action.link : "/";
          const hrefWithAnchor = href === "/" ? "/#page-top" : `${href}#page-top`;
          return (
            <Link key={index} href={hrefWithAnchor}>
              <button
                data-tina-field={tinaField(action)}
                className="btn btn-primary btn-lg rounded-lg"
              >
                {action.label}
                {action.icon &&
                  <IconSVG
                    className={`ml-1 -mr-1 w-6 h-6 opacity-80`}
                  />
                }
              </button>
            </Link>
          );
        })}
    </div>
  );
};

export const actionsSchema = {
  label: "Action Buttons",
  name: "actions",
  type: "object",
  list: true,
  ui: {
    defaultItem: {
      label: "Action Label",
      link: "/",
      icon: "BiRightArrowAlt"
    },
    itemProps: (item) => ({ label: item.label }),
  },
  fields: [
    {
      label: "Label",
      name: "label",
      type: "string",
    },
    {
      label: "Link",
      name: "link",
      type: "string",
    },
    {
      label: "Icon",
      name: "icon",
      type: "string",
      ui: {
        component: IconPickerInput,
      }
    }
  ],
};