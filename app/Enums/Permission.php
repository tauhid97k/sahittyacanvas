<?php

namespace App\Enums;

enum Permission: string
{
    // User permissions
    case LIST_USER = 'LIST_USER';
    case CREATE_USER = 'CREATE_USER';
    case EDIT_USER = 'EDIT_USER';
    case DELETE_USER = 'DELETE_USER';

    // Role permissions
    case LIST_ROLE = 'LIST_ROLE';
    case CREATE_ROLE = 'CREATE_ROLE';
    case EDIT_ROLE = 'EDIT_ROLE';
    case DELETE_ROLE = 'DELETE_ROLE';

    // Product Category permissions (Admin)
    case LIST_PRODUCT_CATEGORY = 'LIST_PRODUCT_CATEGORY';
    case CREATE_PRODUCT_CATEGORY = 'CREATE_PRODUCT_CATEGORY';
    case EDIT_PRODUCT_CATEGORY = 'EDIT_PRODUCT_CATEGORY';
    case DELETE_PRODUCT_CATEGORY = 'DELETE_PRODUCT_CATEGORY';

    // Product permissions (Seller)
    case LIST_PRODUCT = 'LIST_PRODUCT';
    case CREATE_PRODUCT = 'CREATE_PRODUCT';
    case EDIT_PRODUCT = 'EDIT_PRODUCT';
    case DELETE_PRODUCT = 'DELETE_PRODUCT';
    case APPROVE_PRODUCT = 'APPROVE_PRODUCT';

    // Order permissions
    case LIST_ORDER = 'LIST_ORDER';
    case VIEW_ORDER = 'VIEW_ORDER';
    case UPDATE_ORDER_STATUS = 'UPDATE_ORDER_STATUS';
    case CANCEL_ORDER = 'CANCEL_ORDER';
}
