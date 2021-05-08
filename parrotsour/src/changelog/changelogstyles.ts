import { makeStyles } from "@material-ui/core"

export const useStyles = makeStyles((theme) => ({
  changeLI: {
    color: "gray",
    borderBottom: "0px solid gray",
  },
  changeLILast: {
    color: "gray",
    borderBottom: "0px",
  },
  accordion: {
    borderRadius: "20px !important",
    width: "50%",
  },
  accordionChild: {
    borderRadius: "20px !important",
    width: "50%",
    margin: "16px 0",
  },
  column: {
    flexBasis: "33.33%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.pxToRem(15),
  },
}))
