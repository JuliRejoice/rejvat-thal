export type Manager = {
    address: string; 
    createdAt: string;
    email: string;
    isActive: boolean;
    isSocial: boolean;
    name: string;
    phone: string;
    position: string;
    profileImage: string;
    restaurantId: string;
    roleId: {
      _id: string;
      name: string;
    };
    updatedAt: string;
    _id: string;
};
  
export type UIManager = Manager & {
    status: 'active' | 'inactive';
    joinDate: string;
    restaurant: string;
    id: string;
};
  