// Auto-generated TypeScript interfaces for Parking Backend API

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: any[];
  trace_id?: string;
}

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  status?: number;
  orderBy?: string;
  sort?: 'asc' | 'desc';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ApplicationItem {
  id: string;
  code: string;
  name: string;
  is_internal: boolean;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentDependencies {
  menu_id: string;
  permission_ids: string[];
}

export interface AssignmentRoleResponse {
  menus: MenuAssignmentResponse[];
  permissions: PermissionAssignmentResponse[];
  dependencies: AssignmentDependencies[];
}

export interface BaseResponse {
  success: boolean;
  message: string;
  data: Record<string, any>;
  errors: any[][];
  trace_id: string;
}

export interface ChangePasswordUserDto {
  old_password: string;
  new_password: string;
}

export interface CleanupCronResponse {
  otpDeleted: number;
  filesDeleted: number;
}

export interface CreateApplicationDto {
  code: string;
  name: string;
  is_internal: boolean;
  meta?: Record<string, any>;
}

export interface CreateMenuGroupDto {
  name: string;
  sort?: number;
}

export interface CreateParkingRateDto {
  vehicle_type_id: string;
  rate_type: string;
  amount: number;
  additional_amount?: number;
  grace_period_minutes?: number;
  max_daily_amount?: number;
  effective_date: string;
}

export interface CreatePermissionDto {
  name: string;
  key: string;
  resource: string;
  action: string;
  description: string;
}

export interface CreateRoleDto {
  menus: string[];
  resource_permissions: string[];
  name: string;
  description: string;
}

export type TopupMethod = 'cash' | 'transfer' | 'va' | 'qris';

export interface CreateTopupDto {
  customer_id: string;
  amount: number;
  method?: TopupMethod;
  notes?: string;
}

export interface CreateUserDto {
  roles: string[];
  applications: string[];
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
}

export interface CreateVehicleTypeDto {
  name: string;
  description?: string;
}

export interface CustomerItem {
  id: string;
  card_number: string;
  name: string;
  phone: string;
  email: string;
  balance: number;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}

export interface DetailApplicationResponse {
  id: string;
  code: string;
  name: string;
  meta: Record<string, any>;
  is_internal: boolean;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface DetailCustomerResponse {
  id: string;
  card_number: string;
  name: string;
  phone: string;
  email: string;
  balance: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface DetailMenuGroupResponse {
  id: string;
  name: string;
  sort: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface DetailParkingRateResponse {
  id: string;
  vehicle_type_id: string;
  rate_type: string;
  amount: number;
  additional_amount: number;
  grace_period_minutes: number;
  max_daily_amount: number;
  status: number;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export interface DetailPermissionResponse {
  id: string;
  name: string;
  key: string;
  resource: string;
  action: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DetailRoleResponse {
  id: string;
  name: string;
  description: string;
  status: number;
  assigned_menus: string[];
  assigned_resource_permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface DetailTopupResponse {
  id: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  method: TopupMethod | string;
  status: string;
  reference: string;
  notes: string;
  created_at: string;
}

export interface DetailTransactionResponse {
  id: string;
  customer_id: string;
  customer_name: string;
  vehicle_type_id: string;
  vehicle_type_name: string;
  card_number: string;
  vehicle_plate: string;
  check_in_at: string;
  check_out_at: string;
  duration_minutes: number;
  amount: number;
  gate_in: string;
  gate_out: string;
  rate_snapshot: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DetailUserResponse {
  id: string;
  roles: string[];
  username: string;
  name: string;
  email: string;
  phone: string;
  status: number;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

export interface DetailVehicleTypeResponse {
  id: string;
  name: string;
  description: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface DirectUploadResponse {
  filename: string;
}

export interface ForgotResponse {
  token: string;
  expires_in: number;
}

export interface HealthResponseDto {
  status: string;
  /** Healthy component details */
  info: Record<string, any>;
  /** Failed component details */
  error: Record<string, any>;
  /** All component details */
  details: Record<string, any>;
}

export interface ListApplicationResponse {
  items: ApplicationItem[];
  meta: PaginationMeta;
}

export interface ListCustomerResponse {
  items: CustomerItem[];
  meta: PaginationMeta;
}

export interface ListMenuGroupResponse {
  items: MenuGroupItem[];
  meta: PaginationMeta;
}

export interface ListParkingRateResponse {
  items: ParkingRateItem[];
  meta: PaginationMeta;
}

export interface ListPermissionResponse {
  items: PermissionItem[];
  meta: PaginationMeta;
}

export interface ListRoleResponse {
  items: RoleItem[];
  meta: PaginationMeta;
}

export interface ListTopupResponse {
  items: TopupItem[];
  meta: PaginationMeta;
}

export interface ListTransactionResponse {
  items: TransactionItem[];
  meta: PaginationMeta;
}

export interface ListUserResponse {
  items: UserItem[];
  meta: PaginationMeta;
}

export interface ListVehicleTypeResponse {
  items: VehicleTypeItem[];
  meta: PaginationMeta;
}

export interface LoginDto {
  user: string;
  password: string;
  device: Record<string, any>;
}

export interface LoginResponse {
  access_token: string;
  redirect_to: string;
}

export interface MenuAssignmentResponse {
  id: string;
  menu_group_id: string;
  name: string;
  description: string;
  path: string;
  icon: string;
  level: number;
  parent_id: string;
  meta: Record<string, any>;
  sort: number;
  child: string[];
}

export interface MenuGroupItem {
  id: string;
  name: string;
  sort: number;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}

export interface MenuGroupOptionsResponse {
  id: string;
  name: string;
}

export interface MenuGroupResponse {
  group: string;
  items: MenuResponse[];
}

export interface MenuResponse {
  id: string;
  menu_group_id: string;
  name: string;
  description: string;
  path: string;
  icon: string;
  level: number;
  parent_id: string;
  meta: Record<string, any>;
  sort: number;
  child: string[];
}

export interface OptionsApplicationResponse {
  id: string;
  code: string;
  name: string;
}

export interface PaginationMeta {
  page: number;
  total_data: number;
  total_pages: number;
  total_per_page: number;
}

export interface ParkingRateItem {
  id: string;
  vehicle_type_name: string;
  rate_type: string;
  amount: number;
  additional_amount: number;
  grace_period_minutes: number;
  max_daily_amount: number;
  status: number;
  status_text: string;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export interface PermissionAssignmentResponse {
  id: string;
  name: string;
  key: string;
  resource: string;
  action: string;
}

export interface PermissionItem {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PermissionResponse {
  id: string;
  name: string;
  key: string;
  resource: string;
  action: string;
}

export interface PresignUploadDto {
  context: string;
  filename: string;
  filesize: number;
  mimetype: string;
}

export interface PresignUploadResponse {
  url: string;
  expires: number;
}

export interface RequestOtpDto {
  email: string;
}

export interface ResetPasswordDto {
  new_password: string;
  token: string;
}

export interface ResourceUserResponse {
  user: UserResponse;
  menus: MenuGroupResponse[];
  permissions: string[];
}

export interface RoleItem {
  id: string;
  name: string;
  description: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}

export interface RoleOptionsResponse {
  id: string;
  name: string;
}

export interface TopupItem {
  id: string;
  customer_name: string;
  amount: number;
  method: TopupMethod | string;
  status: string;
  reference: string;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  customer_name: string;
  vehicle_type_name: string;
  card_number: string;
  vehicle_plate: string;
  check_in_at: string;
  check_out_at: string;
  duration_minutes: number;
  amount: number;
  gate_in: string;
  gate_out: string;
  status: string;
  created_at: string;
}

export interface UpdateAccountUserDto {
  name: string;
  email: string;
  phone: string;
  image: string;
}

export interface UpdateApplicationDto {
  code: string;
  name: string;
  is_internal: boolean;
  meta?: Record<string, any>;
  status: number;
}

export interface UpdateMenuDto {
  menu_group_id: string;
  name: string;
  description: string;
  sort: number;
  parent_id: string;
}

export interface UpdateMenuGroupDto {
  name: string;
  sort?: number;
  status: number;
}

export interface UpdateParkingRateDto {
  vehicle_type_id: string;
  rate_type: string;
  amount: number;
  additional_amount?: number;
  grace_period_minutes?: number;
  max_daily_amount?: number;
  effective_date: string;
  status: number;
}

export interface UpdateRoleDto {
  menus: string[];
  resource_permissions: string[];
  name: string;
  description: string;
  status: number;
}

export interface UpdateUserDto {
  roles: string[];
  applications: string[];
  username: string;
  name: string;
  email: string;
  phone: string;
  status: number;
}

export interface UpdateVehicleTypeDto {
  name: string;
  description?: string;
  status: number;
}

export interface UserItem {
  id: string;
  roles: string[];
  name: string;
  email: string;
  phone: string;
  status: number;
  status_text: string;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  id: string;
  applications: string[];
  roles: string[];
  name: string;
  email: string;
  phone: string;
  image: Record<string, any>;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleTypeItem {
  id: string;
  name: string;
  description: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleTypeOptionsResponse {
  id: string;
  name: string;
}

export interface VerifyOtpDto {
  otp: string;
  token: string;
}

