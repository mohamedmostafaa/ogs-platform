/**
 * `@ogs/ui/primitives` — shadcn/ui new-york primitives.
 *
 * Phase 01 ships:
 *   Existing: Avatar, Badge, Button, Card, DropdownMenu, Input, Label,
 *             ScrollArea, Separator, Skeleton, Table.
 *   New (this chunk): Accordion, Alert, AlertDialog, Checkbox, Dialog,
 *             Form (RHF+Zod), Popover, Progress, RadioGroup, Select,
 *             Sheet, Sonner, Switch, Tabs, Toggle, ToggleGroup, Tooltip.
 *
 * The remaining shadcn primitives (Calendar, Command, Carousel, Chart,
 * Drawer, Sidebar, etc.) land just-in-time as Phase 02+ consumers
 * appear — no bulk install.
 */
// Accordion
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
// Alert
export { Alert, AlertDescription, AlertTitle, alertVariants } from "./alert";
// AlertDialog
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
// Avatar
export { Avatar, AvatarFallback, AvatarImage } from "./avatar";
// Badge
export { Badge, badgeVariants, type BadgeProps } from "./badge";
// BrowseTile — careers landing (OGS-200b)
export { BrowseTile, type BrowseTileAccent, type BrowseTileProps } from "./browse-tile";
// Button
export { Button, buttonVariants, type ButtonProps } from "./button";
// Card
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
// Checkbox
export { Checkbox } from "./checkbox";
// CountryFlagStrip — careers landing (ahead of OGS-200a)
export {
  CountryFlagStrip,
  type CountryFlagStripProps,
  type SupportedCountryCode,
} from "./country-flag-strip";
// CountryTile — careers landing (OGS-200b)
export { CountryTile, type CountryTileCode, type CountryTileProps } from "./country-tile";
// CtaBanner — careers landing (ahead of OGS-200a)
export { CtaBanner, type CtaBannerProps, type CtaBannerSurface } from "./cta-banner";
// Dialog
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
// FaqAccordion — careers landing (ahead of OGS-200a)
export { FaqAccordion, type FaqAccordionItem, type FaqAccordionProps } from "./faq-accordion";
// FeatureCard — careers landing (ahead of OGS-200a)
export { FeatureCard, type FeatureCardAccent, type FeatureCardProps } from "./feature-card";
// DropdownMenu
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from "./dropdown-menu";
// HeroCarousel — careers landing (ahead of OGS-200a)
export { HeroCarousel, type HeroCarouselProps, type HeroCarouselSlide } from "./hero-carousel";
// JobCard — careers landing (OGS-200b)
export {
  JobCard,
  type JobCardCountryCode,
  type JobCardProps,
  type JobCardRoleFamily,
} from "./job-card";
// JobSearchBar — careers landing (OGS-200b)
export { JobSearchBar, type JobSearchBarProps, type JobSearchCountryCode } from "./job-search-bar";
// LogoMarquee — careers landing (ahead of OGS-200a)
export { LogoMarquee, type LogoMarqueeItem, type LogoMarqueeProps } from "./logo-marquee";
// MarketingFooter — careers landing (ahead of OGS-200a)
export {
  MarketingFooter,
  type MarketingFooterColumn,
  type MarketingFooterLegal,
  type MarketingFooterLink,
  type MarketingFooterProps,
} from "./marketing-footer";
// MarketingHeader — careers landing (ahead of OGS-200a)
export {
  MarketingHeader,
  type MarketingHeaderNavItem,
  type MarketingHeaderProps,
} from "./marketing-header";
// MarketingHero — careers landing (ahead of OGS-200a)
export { MarketingHero, type MarketingHeroProps } from "./marketing-hero";
// QuoteBlock — careers landing (ahead of OGS-200a)
export { QuoteBlock, type QuoteBlockProps } from "./quote-block";
// SectionShell — careers landing (ahead of OGS-200a)
export { SectionShell, type SectionShellProps, type SectionShellSurface } from "./section-shell";
// TimelineSteps — careers landing (ahead of OGS-200a)
export {
  TimelineSteps,
  type TimelineStepItem,
  type TimelineStepsAccent,
  type TimelineStepsProps,
} from "./timeline-steps";
// Form (RHF + Zod adapters)
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
  useFormContext,
  useFormField,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "./form";
// Input
export { Input, type InputProps } from "./input";
// InputOTP
export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./input-otp";
// Label
export { Label } from "./label";
// Popover
export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";
// Progress
export { Progress } from "./progress";
// RadioGroup
export { RadioGroup, RadioGroupItem } from "./radio-group";
// ScrollArea
export { ScrollArea, ScrollBar } from "./scroll-area";
// Select
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
// Separator
export { Separator } from "./separator";
// Sheet
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
// Skeleton
export { Skeleton } from "./skeleton";
// Sonner toast
export { Toaster, toast } from "./sonner";
// Switch
export { Switch } from "./switch";
// Table
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
// Tabs
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
// Toggle + ToggleGroup
export { Toggle, toggleVariants } from "./toggle";
export { ToggleGroup, ToggleGroupItem } from "./toggle-group";
// Tooltip
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
