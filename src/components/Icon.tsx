import cameraIcon from "@/assets/signup-camera.svg";
import alertIcon from "@/assets/icons/alert.svg";
import successCheckIcon from "@/assets/helper-success-check.svg";
import checkIcon from "@/assets/icons/check.svg";
import commentIcon from "@/assets/icons/comment.svg";
import deleteModalIcon from "@/assets/icons/delete-modal.svg";
import editIcon from "@/assets/icons/edit.svg";
import eyeIcon from "@/assets/icons/eye.svg";
import heartDetailFilledIcon from "@/assets/icons/heart-detail-filled.svg";
import heartIcon from "@/assets/icons/heart.svg";
import heartDetailIcon from "@/assets/icons/heart-detail.svg";
import moreIcon from "@/assets/icons/more.svg";
import participationActiveIcon from "@/assets/icons/participation-active.svg";
import participationClosedIcon from "@/assets/icons/participation-closed.svg";
import searchIcon from "@/assets/icons/search.svg";
import trashIcon from "@/assets/icons/trash.svg";
import writeIcon from "@/assets/icons/write.svg";

const ICONS = {
  alert: alertIcon,
  camera: cameraIcon,
  check: checkIcon,
  comment: commentIcon,
  deleteModal: deleteModalIcon,
  edit: editIcon,
  eye: eyeIcon,
  heart: heartIcon,
  heartDetailFilled: heartDetailFilledIcon,
  heartDetail: heartDetailIcon,
  more: moreIcon,
  participationActive: participationActiveIcon,
  participationClosed: participationClosedIcon,
  search: searchIcon,
  successCheck: successCheckIcon,
  trash: trashIcon,
  write: writeIcon,
} as const;

const ICON_SIZE_CLASS = {
  sm: "icon--sm",
  md: "icon--md",
  lg: "icon--lg",
  xl: "icon--xl",
} as const;

export type IconName = keyof typeof ICONS;
export type IconSize = keyof typeof ICON_SIZE_CLASS;

type IconProps = {
  name: IconName;
  size?: IconSize;
  className?: string;
  label?: string;
};

export function Icon({ name, size = "md", className = "", label }: IconProps) {
  return (
    <img
      className={`icon ${ICON_SIZE_CLASS[size]} ${className}`.trim()}
      src={ICONS[name]}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
    />
  );
}
