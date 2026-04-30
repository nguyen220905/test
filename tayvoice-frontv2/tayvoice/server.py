from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from gtts import gTTS
import os
import uuid
import tempfile
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create temp directory for audio files
AUDIO_DIR = Path(tempfile.gettempdir()) / 'tayvoice_tts'
AUDIO_DIR.mkdir(exist_ok=True)

# Cleanup old files (older than 1 hour)
def cleanup_old_files():
    import time
    current_time = time.time()
    for file in AUDIO_DIR.glob('*.mp3'):
        if current_time - file.stat().st_mtime > 3600:  # 1 hour
            try:
                file.unlink()
            except:
                pass

@app.route('/api/tts', methods=['POST', 'OPTIONS'])
def text_to_speech():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Get JSON data safely
        if not request.is_json:
            return jsonify({'success': False, 'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
            
        text = data.get('text', '')
        lang = data.get('lang', 'vi')  # Default to Vietnamese
        slow = data.get('slow', False)
        
        print(f"📝 TTS Request: text='{text[:50]}...', lang={lang}, slow={slow}")
        
        if not text:
            return jsonify({'success': False, 'error': 'No text provided'}), 400
        
        # Generate unique filename
        filename = f'{uuid.uuid4()}.mp3'
        filepath = AUDIO_DIR / filename
        
        print(f"🎤 Generating audio: {filename}")
        
        # Generate speech
        tts = gTTS(text=text, lang=lang, slow=slow)
        tts.save(str(filepath))
        
        print(f"✅ Audio generated: {filepath}")
        
        # Cleanup old files
        cleanup_old_files()
        
        return jsonify({
            'success': True,
            'audio_url': f'/api/audio/{filename}', 
            'filename': filename
        }), 200
    
    except Exception as e:
        print(f"❌ Error in text_to_speech: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/audio/<filename>', methods=['GET'])
def get_audio(filename):
    try:
        filepath = AUDIO_DIR / filename
        if not filepath.exists():
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            str(filepath),
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name=filename
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voices', methods=['GET'])
def get_voices():
    voices = [
        {'code': 'vi', 'name': 'Tiếng Việt', 'lang': 'Vietnamese'},
        {'code': 'en', 'name': 'English', 'lang': 'English'},
        {'code': 'zh-CN', 'name': '中文', 'lang': 'Chinese'},
        {'code': 'ja', 'name': '日本語', 'lang': 'Japanese'},
        {'code': 'ko', 'name': '한국어', 'lang': 'Korean'},
        {'code': 'fr', 'name': 'Français', 'lang': 'French'},
        {'code': 'de', 'name': 'Deutsch', 'lang': 'German'},
        {'code': 'es', 'name': 'Español', 'lang': 'Spanish'},
    ]
    return jsonify({'voices': voices})

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'service': 'TAYVOICE TTS API',
        'status': 'running',
        'endpoints': {
            'health': '/api/health',
            'voices': '/api/voices',
            'tts': '/api/tts (POST)',
            'audio': '/api/audio/<filename>'
        }
    })

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    if request.method == 'OPTIONS':
        return '', 204
    print("✅ Health check called")
    return jsonify({'status': 'ok', 'service': 'TAYVOICE TTS API'}), 200

if __name__ == '__main__':
    print('🚀 TAYVOICE TTS Server starting...')
    print('📍 Server running at: http://localhost:5000')
    print('🎤 API endpoint: http://localhost:5000/api/tts')
    print('✅ Vietnamese TTS ready!')
    print('')
    app.run(host='0.0.0.0', port=5000, debug=True)
