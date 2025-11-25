export default interface NavType {
  name: string;
  href?: string;
  children?: NavType[];
}