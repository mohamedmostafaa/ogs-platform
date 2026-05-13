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
// Button
export { Button, buttonVariants, type ButtonProps } from "./button";
// Card
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
// Checkbox
export { Checkbox } from "./checkbox";
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
