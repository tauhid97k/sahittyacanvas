<?php

namespace App\Enums;

enum Role: string
{
    case SUPER = 'SUPER';
    case ADMIN = 'ADMIN';
    case USER = 'USER';
    case AUTHOR = 'AUTHOR';
    case EDITOR = 'EDITOR';
    case MODERATOR = 'MODERATOR';
}