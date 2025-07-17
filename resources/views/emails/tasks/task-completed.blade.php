<x-mail::message>
# Tugas Telah Selesai

Halo **{{ $recipient->name }}**,

Kami ingin memberitahukan bahwa tugas **"{{ $task->title }}"** telah ditandai sebagai 'Selesai' oleh **{{ $completer->name }}**.

Kerja bagus untuk semua tim yang terlibat!

<x-mail::button :url="config('app.frontend_url') . '/tasks/' . $task->id">
Lihat Detail Tugas
</x-mail::button>

Terima kasih,<br>
</x-mail::message>