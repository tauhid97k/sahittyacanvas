<?php

namespace App\Enums;

enum Permission: string
{
    // User permissions (LIST = menu/route access, VIEW = details page)
    case LIST_USER = 'LIST_USER';
    case VIEW_USER = 'VIEW_USER';
    case CREATE_USER = 'CREATE_USER';
    case EDIT_USER = 'EDIT_USER';
    case DELETE_USER = 'DELETE_USER';
    case BAN_USER = 'BAN_USER';

    // Role permissions
    case LIST_ROLE = 'LIST_ROLE';
    case VIEW_ROLE = 'VIEW_ROLE';
    case CREATE_ROLE = 'CREATE_ROLE';
    case EDIT_ROLE = 'EDIT_ROLE';
    case DELETE_ROLE = 'DELETE_ROLE';
    case MANAGE_ROLE_PERMISSIONS = 'MANAGE_ROLE_PERMISSIONS';

    // Post Category permissions
    case LIST_CATEGORY = 'LIST_CATEGORY';
    case CREATE_CATEGORY = 'CREATE_CATEGORY';
    case EDIT_CATEGORY = 'EDIT_CATEGORY';
    case DELETE_CATEGORY = 'DELETE_CATEGORY';

    // Author permissions
    case LIST_AUTHOR = 'LIST_AUTHOR';
    case CREATE_AUTHOR = 'CREATE_AUTHOR';
    case EDIT_AUTHOR = 'EDIT_AUTHOR';
    case DELETE_AUTHOR = 'DELETE_AUTHOR';

    // Post permissions
    case LIST_POST = 'LIST_POST';
    case VIEW_POST = 'VIEW_POST';
    case CREATE_POST = 'CREATE_POST';
    case EDIT_POST = 'EDIT_POST';
    case DELETE_POST = 'DELETE_POST';
    case RESTORE_POST = 'RESTORE_POST';
    case FORCE_DELETE_POST = 'FORCE_DELETE_POST';

    // Comment permissions
    case LIST_COMMENT = 'LIST_COMMENT';
    case APPROVE_COMMENT = 'APPROVE_COMMENT';
    case REJECT_COMMENT = 'REJECT_COMMENT';
    case DELETE_COMMENT = 'DELETE_COMMENT';

    // Moderation permissions
    case LIST_MODERATION = 'LIST_MODERATION';
    case APPROVE_POST = 'APPROVE_POST';
    case REJECT_POST = 'REJECT_POST';
    case MANAGE_MODERATION_SETTINGS = 'MANAGE_MODERATION_SETTINGS';

    // Product Category permissions (Admin)
    case LIST_PRODUCT_CATEGORY = 'LIST_PRODUCT_CATEGORY';
    case CREATE_PRODUCT_CATEGORY = 'CREATE_PRODUCT_CATEGORY';
    case EDIT_PRODUCT_CATEGORY = 'EDIT_PRODUCT_CATEGORY';
    case DELETE_PRODUCT_CATEGORY = 'DELETE_PRODUCT_CATEGORY';

    // Product permissions (Seller)
    case LIST_PRODUCT = 'LIST_PRODUCT';
    case VIEW_PRODUCT = 'VIEW_PRODUCT';
    case CREATE_PRODUCT = 'CREATE_PRODUCT';
    case EDIT_PRODUCT = 'EDIT_PRODUCT';
    case DELETE_PRODUCT = 'DELETE_PRODUCT';
    case APPROVE_PRODUCT = 'APPROVE_PRODUCT';
    case REJECT_PRODUCT = 'REJECT_PRODUCT';

    // Product Review permissions
    case LIST_PRODUCT_REVIEW = 'LIST_PRODUCT_REVIEW';
    case DELETE_PRODUCT_REVIEW = 'DELETE_PRODUCT_REVIEW';

    // Order permissions
    case LIST_ORDER = 'LIST_ORDER';
    case VIEW_ORDER = 'VIEW_ORDER';
    case UPDATE_ORDER_STATUS = 'UPDATE_ORDER_STATUS';
    case CANCEL_ORDER = 'CANCEL_ORDER';
    case MARK_ORDER_PAID = 'MARK_ORDER_PAID';

    // Transaction permissions
    case LIST_TRANSACTION = 'LIST_TRANSACTION';
    case VIEW_TRANSACTION = 'VIEW_TRANSACTION';
    case MARK_TRANSACTION_PAID = 'MARK_TRANSACTION_PAID';
    case REFUND_TRANSACTION = 'REFUND_TRANSACTION';

    // Payment Method permissions (Admin)
    case LIST_PAYMENT_METHOD = 'LIST_PAYMENT_METHOD';
    case CREATE_PAYMENT_METHOD = 'CREATE_PAYMENT_METHOD';
    case EDIT_PAYMENT_METHOD = 'EDIT_PAYMENT_METHOD';
    case DELETE_PAYMENT_METHOD = 'DELETE_PAYMENT_METHOD';

    // Platform Settings permissions (Super Admin)
    case LIST_PLATFORM_SETTINGS = 'LIST_PLATFORM_SETTINGS';
    case EDIT_PLATFORM_SETTINGS = 'EDIT_PLATFORM_SETTINGS';

    // Activity permissions
    case LIST_ACTIVITY = 'LIST_ACTIVITY';
    case VIEW_ACTIVITY = 'VIEW_ACTIVITY';

    // Dashboard permissions
    case VIEW_DASHBOARD = 'VIEW_DASHBOARD';
}
