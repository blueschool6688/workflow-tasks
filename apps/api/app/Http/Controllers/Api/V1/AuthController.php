<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $usernameOrEmail = $request->input('username');
        $user = User::where('email', $usernameOrEmail)
            ->orWhere('username', $usernameOrEmail)
            ->first();

        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Tên đăng nhập hoặc mật khẩu không chính xác.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Tài khoản của bạn đã bị khóa.'],
            ]);
        }

        $tokenResult = $user->createToken('client-web-token');
        $token = $tokenResult->accessToken;

        return response()->json([
            'message'    => 'Đăng nhập thành công',
            'token'      => $token,
            'token_type' => 'Bearer',
            'user'       => $this->formatUser($user),
            'workspaces' => $user->workspaces()->get(['workspaces.id', 'workspaces.name', 'workspaces.slug']),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user'       => $this->formatUser($user),
            'workspaces' => $user->workspaces()->get(['workspaces.id', 'workspaces.name', 'workspaces.slug']),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'username' => 'sometimes|required|string|max:100|unique:users,username,' . $user->id,
            'email'    => 'sometimes|required|email|unique:users,email,' . $user->id,
            'avatar'   => 'sometimes|nullable|string|max:500',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Cập nhật hồ sơ thành công',
            'user'    => $this->formatUser($user->fresh()),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($request->input('current_password'), $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mật khẩu hiện tại không chính xác.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->input('password'))]);

        return response()->json(['message' => 'Đổi mật khẩu thành công']);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            if (method_exists($user, 'token') && $user->token()) {
                $user->token()->revoke();
            }
            if (method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            }
        }

        return response()->json(['message' => 'Đã đăng xuất thành công']);
    }

    private function formatUser(User $user): array
    {
        return [
            'id'                   => $user->id,
            'name'                 => $user->name,
            'username'             => $user->username,
            'email'                => $user->email,
            'avatar'               => $user->avatar ? asset('storage/' . $user->avatar) : null,
            'role'                 => $user->role ?? 'member',
            'current_workspace_id' => $user->current_workspace_id,
        ];
    }
}
