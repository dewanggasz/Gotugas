<x-mail::message>
# Komentar Baru

**{{ $commenter->name }}** telah menambahkan komentar pada tugas **"{{ $task->title }}"**.

<x-mail::panel>
{{ $comment->body }}
</x-mail::panel>

Klik tombol di bawah ini untuk melihat percakapan selengkapnya.

<x-mail::button :url="config('app.frontend_url') . '/tasks/' . $task->id">
Lihat Tugas
</x-mail::button>

Terima kasih,<br>
Tim {{ config('app.name') }}
</x-mail::message>
