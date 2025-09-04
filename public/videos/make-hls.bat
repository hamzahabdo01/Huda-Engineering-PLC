@echo off
set INPUT=input.mp4

:: 1080p
ffmpeg -i %INPUT% -vf "scale=w=1920:h=1080:force_original_aspect_ratio=decrease" -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -g 48 -keyint_min 48 -sc_threshold 0 -b:v 5000k -maxrate 5350k -bufsize 7500k -b:a 192k -hls_time 4 -hls_segment_filename 1080p_%%03d.ts -hls_playlist_type vod 1080p.m3u8

:: 720p
ffmpeg -i %INPUT% -vf "scale=w=1280:h=720:force_original_aspect_ratio=decrease" -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 23 -g 48 -keyint_min 48 -sc_threshold 0 -b:v 2800k -maxrate 2996k -bufsize 4200k -b:a 128k -hls_time 4 -hls_segment_filename 720p_%%03d.ts -hls_playlist_type vod 720p.m3u8

:: 480p
ffmpeg -i %INPUT% -vf "scale=w=854:h=480:force_original_aspect_ratio=decrease" -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 26 -g 48 -keyint_min 48 -sc_threshold 0 -b:v 1400k -maxrate 1498k -bufsize 2100k -b:a 96k -hls_time 4 -hls_segment_filename 480p_%%03d.ts -hls_playlist_type vod 480p.m3u8

:: Create master playlist
(
echo #EXTM3U
echo #EXT-X-VERSION:3
echo.
echo #EXT-X-STREAM-INF:BANDWIDTH=5350000,RESOLUTION=1920x1080
echo 1080p.m3u8
echo #EXT-X-STREAM-INF:BANDWIDTH=2996000,RESOLUTION=1280x720
echo 720p.m3u8
echo #EXT-X-STREAM-INF:BANDWIDTH=1498000,RESOLUTION=854x480
echo 480p.m3u8
) > master.m3u8

echo Done! Master playlist created: master.m3u8
pause
