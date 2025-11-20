<?php

namespace App\Enums;

enum Permission: string
{
    case LIST_USER = 'LIST_USER';
    case CREATE_USER = 'CREATE_USER';
    case EDIT_USER = 'EDIT_USER';
    case DELETE_USER = 'DELETE_USER';
    case LIST_ROLE = 'LIST_ROLE';
    case CREATE_ROLE = 'CREATE_ROLE';
    case EDIT_ROLE = 'EDIT_ROLE';
    case DELETE_ROLE = 'DELETE_ROLE';
}
