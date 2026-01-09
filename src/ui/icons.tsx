export const PlusIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor" }}
    viewBox="0 0 16 16"
    width={size}
  >
    <path
      clipRule="evenodd"
      d="M 8.75,1 H7.25 V7.25 H1.5 V8.75 H7.25 V15 H8.75 V8.75 H14.5 V7.25 H8.75 V1.75 Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const TrashIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor" }}
    viewBox="0 0 16 16"
    width={size}
  >
    <path
      clipRule="evenodd"
      d="M6.75 2.75C6.75 2.05964 7.30964 1.5 8 1.5C8.69036 1.5 9.25 2.05964 9.25 2.75V3H6.75V2.75ZM5.25 3V2.75C5.25 1.23122 6.48122 0 8 0C9.51878 0 10.75 1.23122 10.75 2.75V3H12.9201H14.25H15V4.5H14.25H13.8846L13.1776 13.6917C13.0774 14.9942 11.9913 16 10.6849 16H5.31508C4.00874 16 2.92263 14.9942 2.82244 13.6917L2.11538 4.5H1.75H1V3H1.75H3.07988H5.25ZM4.31802 13.5767L3.61982 4.5H12.3802L11.682 13.5767C11.6419 14.0977 11.2075 14.5 10.6849 14.5H5.31508C4.79254 14.5 4.3581 14.0977 4.31802 13.5767Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const ArrowUpIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M8.70711 1.39644C8.31659 1.00592 7.68342 1.00592 7.2929 1.39644L2.21968 6.46966L1.68935 6.99999L2.75001 8.06065L3.28034 7.53032L7.25001 3.56065V14.25V15H8.75001V14.25V3.56065L12.7197 7.53032L13.25 8.06065L14.3107 6.99999L13.7803 6.46966L8.70711 1.39644Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const PaperclipIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    className="-rotate-45"
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M10.8591 1.70735C10.3257 1.70735 9.81417 1.91925 9.437 2.29643L3.19455 8.53886C2.56246 9.17095 2.20735 10.0282 2.20735 10.9222C2.20735 11.8161 2.56246 12.6734 3.19455 13.3055C3.82665 13.9376 4.68395 14.2927 5.57786 14.2927C6.47178 14.2927 7.32908 13.9376 7.96117 13.3055L14.2036 7.06304L14.7038 6.56287L15.7041 7.56321L15.204 8.06337L8.96151 14.3058C8.06411 15.2032 6.84698 15.7074 5.57786 15.7074C4.30875 15.7074 3.09162 15.2032 2.19422 14.3058C1.29682 13.4084 0.792664 12.1913 0.792664 10.9222C0.792664 9.65305 1.29682 8.43592 2.19422 7.53852L8.43666 1.29609C9.07914 0.653606 9.95054 0.292664 10.8591 0.292664C11.7678 0.292664 12.6392 0.653606 13.2816 1.29609C13.9241 1.93857 14.2851 2.80997 14.2851 3.71857C14.2851 4.62718 13.9241 5.49858 13.2816 6.14106L13.2814 6.14133L7.0324 12.3835C7.03231 12.3836 7.03222 12.3837 7.03213 12.3838C6.64459 12.7712 6.11905 12.9888 5.57107 12.9888C5.02297 12.9888 4.49731 12.7711 4.10974 12.3835C3.72217 11.9959 3.50444 11.4703 3.50444 10.9222C3.50444 10.3741 3.72217 9.8484 4.10974 9.46084L4.11004 9.46054L9.877 3.70039L10.3775 3.20051L11.3772 4.20144L10.8767 4.70131L5.11008 10.4612C5.11005 10.4612 5.11003 10.4612 5.11 10.4613C4.98779 10.5835 4.91913 10.7493 4.91913 10.9222C4.91913 11.0951 4.98782 11.2609 5.11008 11.3832C5.23234 11.5054 5.39817 11.5741 5.57107 11.5741C5.74398 11.5741 5.9098 11.5054 6.03206 11.3832L6.03233 11.3829L12.2813 5.14072C12.2814 5.14063 12.2815 5.14054 12.2816 5.14045C12.6586 4.7633 12.8704 4.25185 12.8704 3.71857C12.8704 3.18516 12.6585 2.6736 12.2813 2.29643C11.9041 1.91925 11.3926 1.70735 10.8591 1.70735Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const SidebarLeftIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor" }}
    viewBox="0 0 16 16"
    width={size}
  >
    <path
      clipRule="evenodd"
      d="M6.245 2.5H14.5V12.5C14.5 13.0523 14.0523 13.5 13.5 13.5H6.245V2.5ZM4.995 2.5H1.5V12.5C1.5 13.0523 1.94772 13.5 2.5 13.5H4.995V2.5ZM0 1H1.5H14.5H16V2.5V12.5C16 13.8807 14.8807 15 13.5 15H2.5C1.11929 15 0 13.8807 0 12.5V2.5V1Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const Loader2Icon = ({
  size = 16,
  className = "",
  ...props
}: { size?: number; className?: string } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    className={className}
    {...props}
  >
    <path
      d="M8 1.5A6.5 6.5 0 1 0 14.5 8"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
);

export const SendIcon = ({
  size = 16,
  className = "",
  ...props
}: { size?: number; className?: string } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    className={className}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M1.591 2.205a.75.75 0 0 1 .84-.405l12.5 2.5a.75.75 0 0 1 .564.864.75.75 0 0 1-.564.636L9.5 7.5v5.25a.75.75 0 0 1-1.28.53L5.5 9.5l-3.75 2.25a.75.75 0 0 1-1.03-.97l1.5-6.5a.75.75 0 0 1 .371-.525Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const SquareIcon = ({
  size = 16,
  className = "",
  ...props
}: { size?: number; className?: string } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    className={className}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M2.5 2.5h11v11h-11v-11Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const XIcon = ({
  size = 16,
  className = "",
  ...props
}: { size?: number; className?: string } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    className={className}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M12.207 4.207a1 1 0 0 0-1.414-1.414L8 6.586 5.207 3.793a1 1 0 0 0-1.414 1.414L6.586 8l-2.793 2.793a1 1 0 1 0 1.414 1.414L8 9.414l2.793 2.793a1 1 0 0 0 1.414-1.414L9.414 8l2.793-2.793Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const ShareIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M8.70711 1.29289C8.31658 0.902369 7.68342 0.902369 7.29289 1.29289C6.90237 1.68342 6.90237 2.31658 7.29289 2.70711L9.58579 5H3C2.44772 5 2 5.44772 2 6V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V6C14 5.44772 13.5523 5 13 5H10.4142L8.70711 3.29289C8.31658 2.90237 8.31658 2.2692 8.70711 1.87868C8.90237 1.68342 9.15858 1.58579 9.41479 1.58579C9.671 1.58579 9.92721 1.68342 10.1225 1.87868L13.2929 5.04907C13.6834 5.43959 13.6834 6.07276 13.2929 6.46328L10.1225 9.63367C9.92721 9.82893 9.671 9.92656 9.41479 9.92656C9.15858 9.92656 8.90237 9.82893 8.70711 9.63367C8.31658 9.24314 8.31658 8.60998 8.70711 8.21946L10.4142 6.51236H13V12.5H3V6.51236H5.58579L7.29289 8.21946C7.68342 8.60998 7.68342 9.24314 7.29289 9.63367C6.90237 10.0242 6.2692 10.0242 5.87868 9.63367L2.70711 6.46328C2.31658 6.07276 2.31658 5.43959 2.70711 5.04907L5.87868 1.87868C6.2692 1.48816 6.90237 1.48816 7.29289 1.87868C7.68342 2.2692 7.68342 2.90237 7.29289 3.29289L5.58579 5H8.41421L8.70711 1.29289Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const ExploreIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8ZM8 4.5C6.067 4.5 4.5 6.067 4.5 8C4.5 9.933 6.067 11.5 8 11.5C9.933 11.5 11.5 9.933 11.5 8C11.5 6.067 9.933 4.5 8 4.5ZM6 8C6 6.89543 6.89543 6 8 6C9.10457 6 10 6.89543 10 8C10 9.10457 9.10457 10 8 10C6.89543 10 6 9.10457 6 8Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const CopyIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M5.5 2C4.67157 2 4 2.67157 4 3.5V10.5C4 11.3284 4.67157 12 5.5 12H6V13.5C6 14.3284 6.67157 15 7.5 15H12.5C13.3284 15 14 14.3284 14 13.5V6.5C14 5.67157 13.3284 5 12.5 5H11V3.5C11 2.67157 10.3284 2 9.5 2H5.5ZM9.5 3.5H5.5V10.5H7.5V6.5C7.5 5.67157 8.17157 5 9 5H11V3.5H9.5ZM9 6.5H12.5V13.5H7.5V6.5H9Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const CheckIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M13.8536 3.64645C14.0488 3.84171 14.0488 4.15829 13.8536 4.35355L6.35355 11.8536C6.15829 12.0488 5.84171 12.0488 5.64645 11.8536L2.14645 8.35355C1.95118 8.15829 1.95118 7.84171 2.14645 7.64645C2.34171 7.45118 2.65829 7.45118 2.85355 7.64645L6 10.7929L13.1464 3.64645C13.3417 3.45118 13.6583 3.45118 13.8536 3.64645Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const ThumbsUpIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M5.5 6.5C5.5 5.94772 5.94772 5.5 6.5 5.5H8.5V2.5C8.5 1.94772 8.94772 1.5 9.5 1.5C10.0523 1.5 10.5 1.94772 10.5 2.5V5.5H12.5C13.0523 5.5 13.5 5.94772 13.5 6.5V13.5C13.5 14.0523 13.0523 14.5 12.5 14.5H6.5C5.94772 14.5 5.5 14.0523 5.5 13.5V6.5ZM7 6.5V13H12.5V6.5H10.5V2.5C10.5 2.22386 10.2761 2 10 2C9.72386 2 9.5 2.22386 9.5 2.5V6.5H7ZM3.5 4.5C3.5 4.22386 3.72386 4 4 4H4.5V3.5C4.5 3.22386 4.72386 3 5 3C5.27614 3 5.5 3.22386 5.5 3.5V4H6C6.27614 4 6.5 4.22386 6.5 4.5C6.5 4.77614 6.27614 5 6 5H5.5V6.5C5.5 6.77614 5.27614 7 5 7C4.72386 7 4.5 6.77614 4.5 6.5V5H4C3.72386 5 3.5 4.77614 3.5 4.5Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const ThumbsDownIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M10.5 9.5C10.5 10.0523 10.0523 10.5 9.5 10.5H7.5V13.5C7.5 14.0523 7.05228 14.5 6.5 14.5C5.94772 14.5 5.5 14.0523 5.5 13.5V10.5H3.5C2.94772 10.5 2.5 10.0523 2.5 9.5V2.5C2.5 1.94772 2.94772 1.5 3.5 1.5H9.5C10.0523 1.5 10.5 1.94772 10.5 2.5V9.5ZM9 9.5V3H3.5V9.5H5.5V13.5C5.5 13.7761 5.72386 14 6 14C6.27614 14 6.5 13.7761 6.5 13.5V9.5H9ZM12.5 11.5C12.5 11.7761 12.2761 12 12 12H11.5V12.5C11.5 12.7761 11.2761 13 11 13C10.7239 13 10.5 12.7761 10.5 12.5V12H10C9.72386 12 9.5 11.7761 9.5 11.5C9.5 11.2239 9.72386 11 10 11H10.5V9.5C10.5 9.22386 10.7239 9 11 9C11.2761 9 11.5 9.22386 11.5 9.5V11H12C12.2761 11 12.5 11.2239 12.5 11.5Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const RefreshIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 8.41421 1.16421 8.75 0.75 8.75C0.335786 8.75 0 8.41421 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C7.58579 16 7.25 15.6642 7.25 15.25C7.25 14.8358 7.58579 14.5 8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5ZM8 4.5C8.41421 4.5 8.75 4.83579 8.75 5.25V7.25H10.75C11.1642 7.25 11.5 7.58579 11.5 8C11.5 8.41421 11.1642 8.75 10.75 8.75H8C7.58579 8.75 7.25 8.41421 7.25 8V5.25C7.25 4.83579 7.58579 4.5 8 4.5Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const MoreActionsIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M3 8C3 8.55228 3.44772 9 4 9C4.55228 9 5 8.55228 5 8C5 7.44772 4.55228 7 4 7C3.44772 7 3 7.44772 3 8ZM8 8C8 8.55228 8.44772 9 9 9C9.55228 9 10 8.55228 10 8C10 7.44772 9.55228 7 9 7C8.44772 7 8 7.44772 8 8ZM12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const AddPeopleIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M8 1.5C6.067 1.5 4.5 3.067 4.5 5C4.5 6.933 6.067 8.5 8 8.5C9.933 8.5 11.5 6.933 11.5 5C11.5 3.067 9.933 1.5 8 1.5ZM6 5C6 3.89543 6.89543 3 8 3C9.10457 3 10 3.89543 10 5C10 6.10457 9.10457 7 8 7C6.89543 7 6 6.10457 6 5ZM3.5 12.5C3.5 10.0147 5.51472 8 8 8C10.4853 8 12.5 10.0147 12.5 12.5V14.5H3.5V12.5ZM8 9.5C6.34315 9.5 5 10.8431 5 12.5V13H11V12.5C11 10.8431 9.65685 9.5 8 9.5ZM12.5 6.5C12.5 6.22386 12.7239 6 13 6H14.5V4.5C14.5 4.22386 14.7239 4 15 4C15.2761 4 15.5 4.22386 15.5 4.5V6H17C17.2761 6 17.5 6.22386 17.5 6.5C17.5 6.77614 17.2761 7 17 7H15.5V8.5C15.5 8.77614 15.2761 9 15 9C14.7239 9 14.5 8.77614 14.5 8.5V7H13C12.7239 7 12.5 6.77614 12.5 6.5Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const MenuIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M2 4C2 3.44772 2.44772 3 3 3H13C13.5523 3 14 3.44772 14 4C14 4.55228 13.5523 5 13 5H3C2.44772 5 2 4.55228 2 4ZM2 8C2 7.44772 2.44772 7 3 7H13C13.5523 7 14 7.44772 14 8C14 8.55228 13.5523 9 13 9H3C2.44772 9 2 8.55228 2 8ZM3 11C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13H13C13.5523 13 14 12.5523 14 12C14 11.4477 13.5523 11 13 11H3Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const MetadataIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM8 1.5C11.5899 1.5 14.5 4.41015 14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5ZM8 4.5C7.58579 4.5 7.25 4.83579 7.25 5.25V8.75C7.25 9.16421 7.58579 9.5 8 9.5C8.41421 9.5 8.75 9.16421 8.75 8.75V5.25C8.75 4.83579 8.41421 4.5 8 4.5ZM8 11C8.55228 11 9 10.5523 9 10C9 9.44772 8.55228 9 8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const ChevronDownIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M4.29289 5.29289C4.68342 4.90237 5.31658 4.90237 5.70711 5.29289L8 2.99999L10.2929 5.29289C10.6834 5.68342 11.3166 5.68342 11.7071 5.29289C12.0976 4.90237 12.0976 4.2692 11.7071 3.87868L8.70711 0.87868C8.31658 0.488155 7.68342 0.488155 7.29289 0.87868L4.29289 3.87868C3.90237 4.2692 3.90237 4.90237 4.29289 5.29289Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const ChevronUpIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M7.29289 4.29289C7.68342 3.90237 8.31658 3.90237 8.70711 4.29289L13.7071 9.29289C14.0976 9.68342 14.0976 10.3166 13.7071 10.7071C13.3166 11.0976 12.6834 11.0976 12.2929 10.7071L8 6.41421L3.70711 10.7071C3.31658 11.0976 2.68342 11.0976 2.29289 10.7071C1.90237 10.3166 1.90237 9.68342 2.29289 9.29289L7.29289 4.29289Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const BaseIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM11.5 5.5C11.7761 5.5 12 5.72386 12 6V10C12 10.2761 11.7761 10.5 11.5 10.5H4.5C4.22386 10.5 4 10.2761 4 10V6C4 5.72386 4.22386 5.5 4.5 5.5H11.5ZM10.5 7H5.5V9.5H10.5V7Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const WorldIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM8 1.5C11.5899 1.5 14.5 4.41015 14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5ZM2.5 6.5H13.5M2.5 9.5H13.5M8 1.5V14.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export const SearchIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M6.5 1C3.46243 1 1 3.46243 1 6.5C1 9.53757 3.46243 12 6.5 12C7.83879 12 9.06586 11.5217 10.0227 10.7305L13.6464 14.3536L14.3536 13.6464L10.7305 10.0227C11.5217 9.06586 12 7.83879 12 6.5C12 3.46243 9.53757 1 6.5 1ZM2.5 6.5C2.5 4.29086 4.29086 2.5 6.5 2.5C8.70914 2.5 10.5 4.29086 10.5 6.5C10.5 8.70914 8.70914 10.5 6.5 10.5C4.29086 10.5 2.5 8.70914 2.5 6.5Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const ResetIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 8.41421 1.16421 8.75 0.75 8.75C0.335786 8.75 0 8.41421 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C7.58579 16 7.25 15.6642 7.25 15.25C7.25 14.8358 7.58579 14.5 8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5ZM11.7803 4.21967C12.0732 4.51256 12.0732 4.98744 11.7803 5.28033L9.06066 8L11.7803 10.7197C12.0732 11.0126 12.0732 11.4874 11.7803 11.7803C11.4874 12.0732 11.0126 12.0732 10.7197 11.7803L7.46967 8.53033C7.17678 8.23744 7.17678 7.76256 7.46967 7.46967L10.7197 4.21967C11.0126 3.92678 11.4874 3.92678 11.7803 4.21967Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const AnalyticsIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M2 12.5C2 12.2239 2.22386 12 2.5 12H13.5C13.7761 12 14 12.2239 14 12.5C14 12.7761 13.7761 13 13.5 13H2.5C2.22386 13 2 12.7761 2 12.5ZM3.5 9.5C3.5 9.22386 3.72386 9 4 9H5.5C5.77614 9 6 9.22386 6 9.5V11.5C6 11.7761 5.77614 12 5.5 12H4C3.72386 12 3.5 11.7761 3.5 11.5V9.5ZM7 6.5C7 6.22386 7.22386 6 7.5 6H9C9.27614 6 9.5 6.22386 9.5 6.5V11.5C9.5 11.7761 9.27614 12 9 12H7.5C7.22386 12 7 11.7761 7 11.5V6.5ZM10.5 4C10.5 3.72386 10.7239 3.5 11 3.5H12.5C12.7761 3.5 13 3.72386 13 4V11.5C13 11.7761 12.7761 12 12.5 12H11C10.7239 12 10.5 11.7761 10.5 11.5V4Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const CodeIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M5.28033 4.21967C5.57322 3.92678 6.04809 3.92678 6.34099 4.21967L10.341 8.21967C10.6339 8.51256 10.6339 8.98744 10.341 9.28033L6.34099 13.2803C6.04809 13.5732 5.57322 13.5732 5.28033 13.2803C4.98744 12.9874 4.98744 12.5126 5.28033 12.2197L8.5 9L5.28033 5.78033C4.98744 5.48744 4.98744 5.01256 5.28033 4.71967C5.57322 4.42678 6.04809 4.42678 6.34099 4.71967L10.341 8.71967C10.6339 9.01256 10.6339 9.48744 10.341 9.78033L6.34099 13.7803C6.04809 14.0732 5.57322 14.0732 5.28033 13.7803C4.98744 13.4874 4.98744 13.0126 5.28033 12.7197L8.5 9.5L5.28033 6.28033C4.98744 5.98744 4.98744 5.51256 5.28033 5.21967ZM10.7197 4.21967C11.0126 3.92678 11.4874 3.92678 11.7803 4.21967C12.0732 4.51256 12.0732 4.98744 11.7803 5.28033L7.78033 9.28033C7.48744 9.57322 7.01256 9.57322 6.71967 9.28033C6.42678 8.98744 6.42678 8.51256 6.71967 8.21967L10.7197 4.21967Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const EditIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M11.8536 1.14645C12.0488 1.34171 12.0488 1.65829 11.8536 1.85355L5.35355 8.35355C5.15829 8.54882 4.84171 8.54882 4.64645 8.35355L2.14645 5.85355C1.95118 5.65829 1.95118 5.34171 2.14645 5.14645C2.34171 4.95118 2.65829 4.95118 2.85355 5.14645L5 7.29289L11.1464 1.14645C11.3417 0.951184 11.6583 0.951184 11.8536 1.14645ZM2 11.5C2 11.2239 2.22386 11 2.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H2.5C2.22386 12 2 11.7761 2 11.5Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const HelpIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM8 1.5C11.5899 1.5 14.5 4.41015 14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5ZM8 4.5C6.89543 4.5 6 5.39543 6 6.5C6 6.77614 6.22386 7 6.5 7C6.77614 7 7 6.77614 7 6.5C7 5.94772 7.44772 5.5 8 5.5C8.55228 5.5 9 5.94772 9 6.5C9 7.05228 8.55228 7.5 8 7.5C7.72386 7.5 7.5 7.72386 7.5 8V9.5C7.5 9.77614 7.72386 10 8 10C8.27614 10 8.5 9.77614 8.5 9.5V8.5C9.32843 8.5 10 7.82843 10 7C10 5.89543 9.10457 5 8 5C6.89543 5 6 5.89543 6 7C6 7.27614 6.22386 7.5 6.5 7.5C6.77614 7.5 7 7.27614 7 7C7 6.72386 7.22386 6.5 7.5 6.5H8C8.55228 6.5 9 6.94772 9 7.5C9 8.05228 8.55228 8.5 8 8.5C7.72386 8.5 7.5 8.72386 7.5 9V10.5C7.5 10.7761 7.72386 11 8 11C8.27614 11 8.5 10.7761 8.5 10.5V9.5C9.32843 9.5 10 8.82843 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 8.27614 6.22386 8.5 6.5 8.5C6.77614 8.5 7 8.27614 7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8C9 8.55228 8.55228 9 8 9C7.72386 9 7.5 9.22386 7.5 9.5V11C7.5 11.2761 7.72386 11.5 8 11.5C8.27614 11.5 8.5 11.2761 8.5 11V9.5C9.32843 9.5 10 8.82843 10 8C10 6.89543 9.10457 6 8 6Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
