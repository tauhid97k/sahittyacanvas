<?php

namespace App\Http\Controllers;

use App\Models\EditorMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class EditorMediaController extends Controller
{
    /**
     * Upload an image for the rich text editor
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120'], // 5MB max
            'context' => ['nullable', 'string', 'max:50'],
        ]);

        $editorMedia = EditorMedia::create([
            'user_id' => Auth::id(),
            'context' => $request->input('context', 'general'),
        ]);

        $media = $editorMedia
            ->addMediaFromRequest('image')
            ->toMediaCollection('images');

        return response()->json([
            'success' => true,
            'url' => $media->getUrl(),
            'mediaId' => $media->id,
            'urls' => [
                'original' => $media->getUrl(),
                'large' => $media->getUrl('large'),
                'medium' => $media->getUrl('medium'),
                'thumb' => $media->getUrl('thumb'),
            ],
        ]);
    }

    /**
     * Delete an image from the editor
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'url' => ['required', 'string'],
        ]);

        $url = $request->input('url');

        // Find media by URL
        $media = Media::where('model_type', EditorMedia::class)
            ->get()
            ->first(function ($media) use ($url) {
                return $media->getUrl() === $url ||
                       str_contains($url, $media->file_name);
            });

        if (!$media) {
            return response()->json([
                'success' => false,
                'message' => 'Media not found',
            ], 404);
        }

        // Check ownership
        $editorMedia = EditorMedia::find($media->model_id);
        if ($editorMedia && $editorMedia->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Delete the media
        $media->delete();

        // Delete the EditorMedia record if it has no more media
        if ($editorMedia && $editorMedia->media()->count() === 0) {
            $editorMedia->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully',
        ]);
    }
}
