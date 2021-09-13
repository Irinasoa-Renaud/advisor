import Role from '../types/Role';

export default class RoleFormatter {
  public static format(roles: Role[]): string {

    if (roles.includes('ROLE_RESTAURANT_ADMIN')) {
      return 'Restaurateur';
    }

    if (roles.includes('ROLE_ADMIN')) {
      return 'Administrateur';
    }

    if (roles.includes('ROLE_DELIVERY_AGENT')) {
      return 'Agent de livraison';
    }

    return 'Utilisateur';

  }

  public static compare(a: Role[], b: Role[]): number {
    return RoleFormatter.format(a).localeCompare(RoleFormatter.format(b));
  }

  public static hasAdminRole(roles: Role[]): boolean {
    return roles.indexOf('ROLE_ADMIN') !== -1;
  }

  public static hasRestaurantAdminRole(roles: Role[]): boolean {
    return roles.indexOf('ROLE_RESTAURANT_ADMIN') !== -1;
  }

  public static hasDeliveryAgentRole(roles: Role[]): boolean {
    return roles.indexOf('ROLE_DELIVERY_AGENT') !== -1;
  }
}
