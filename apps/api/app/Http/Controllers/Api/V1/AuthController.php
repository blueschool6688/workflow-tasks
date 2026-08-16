<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle authentication (Local & LDAP ready)
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $input = $request->input('username');
        $password = $request->input('password');

        // Check local database by email or username
        $user = User::where('email', $input)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Tên đăng nhập hoặc mật khẩu không chính xác.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Tài khoản của bạn đã bị khóa.'],
            ]);
        }

        // Issue Sanctum token
        $token = $user->createToken('client-web-token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
                'role' => $user->getRoleNames()->first() ?? 'member',
                'current_workspace_id' => $user->current_workspace_id,
            ],
        ]);
    }

    /**
     * Get authenticated user profile
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
                'role' => $user->getRoleNames()->first() ?? 'member',
                'current_workspace_id' => $user->current_workspace_id,
            ],
            'workspaces' => $user->workspaces()->get(['workspaces.id', 'workspaces.name', 'workspaces.slug', 'workspaces.logo']),
        ]);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đã đăng xuất thành công',
        ]);
    }
}
