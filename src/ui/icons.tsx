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
