<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UpdatePasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_update_their_password(): void
    {
        $user = User::factory()->create(['password' => 'current-password']);

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/user/password', [
            'current_password' => 'current-password',
            'new_password' => 'updated-password',
            'new_password_confirmation' => 'updated-password',
        ]);

        $response->assertOk();
        $this->assertTrue(Hash::check('updated-password', $user->fresh()->password));
    }

    public function test_password_update_requires_the_current_password(): void
    {
        $user = User::factory()->create(['password' => 'current-password']);

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/user/password', [
            'current_password' => 'wrong-password',
            'new_password' => 'updated-password',
            'new_password_confirmation' => 'updated-password',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');
        $this->assertTrue(Hash::check('current-password', $user->fresh()->password));
    }
}
