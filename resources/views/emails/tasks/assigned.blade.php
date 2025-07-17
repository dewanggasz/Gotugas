<x-mail::message>
# Halo!

Anda baru saja ditambahkan sebagai kolaborator pada sebuah tugas oleh **{{ $assigner->name }}**.

**Judul Tugas:** {{ $task->title }}

**Deskripsi:**
{{ $task->description ?? 'Tidak ada deskripsi.' }}

Anda dapat melihat detail tugas dengan mengklik tombol di bawah ini.

<x-mail::button :url="config('app.frontend_url') . '/tasks/' . $task->id">
Lihat Tugas
</x-mail::button>

Terima kasih,<br>
Tim {{ config('app.name') }}
</x-mail::message>