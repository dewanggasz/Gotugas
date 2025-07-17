<x-mail::message>
# Notifikasi Tugas Baru

Halo,

**{{ $assigner->name }}** telah membuat tugas baru dengan judul **"{{ $task->title }}"**.

Sebagai admin, Anda menerima notifikasi ini untuk semua tugas yang dibuat di dalam sistem.

@if($task->description)
**Deskripsi Tugas:**
<x-mail::panel>
{{ $task->description }}
</x-mail::panel>
@endif

Anda dapat meninjau detail tugas selengkapnya dengan mengklik tombol di bawah ini.

<x-mail::button :url="config('app.frontend_url') . '/tasks/' . $task->id">
Lihat Detail Tugas
</x-mail::button>

Terima kasih,<br>
</x-mail::message>
