// DSBuffer.h : Definition of CDSBuffer class
//

#if !defined(AFX_DSBUFFER_H__7517D749_96E3_11D2_BBF3_9EB4940D843C__INCLUDED_)
#define AFX_DSBUFFER_H__7517D749_96E3_11D2_BBF3_9EB4940D843C__INCLUDED_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000

#include <mmsystem.h>
#include <dsound.h>

struct WaveHeader
{
	BYTE        RIFF[4];          // "RIFF"
	DWORD       dwSize;           // Size of data to follow
	BYTE        WAVE[4];          // "WAVE"
	BYTE        fmt_[4];          // "fmt "
	DWORD       dw16;             // 16
	WORD        wOne_0;           // 1
	WORD        wChnls;           // Number of Channels
	DWORD       dwSRate;          // Sample Rate
	DWORD       BytesPerSec;      // Sample Rate
	WORD        wBlkAlign;        // 1
	WORD        BitsPerSample;    // Sample size
	BYTE        DATA[4];          // "DATA"
	DWORD       dwDSize;          // Number of Samples
};

class CDSBuffer : public CObject
{
// Attribute
protected:
	LPDIRECTSOUNDBUFFER		m_lpDSBuffer;			// Sound buffer
	LPDIRECTSOUND3DBUFFER	m_lpDS3DBuffer;			// 3D buffer

// Construction / Destruction
public:
	CDSBuffer();
	CDSBuffer(const char* FileName, LPDIRECTSOUND lpDS, DWORD dwFlags = DSBCAPS_CTRLDEFAULT);
	~CDSBuffer();

// Methods
public:
	BOOL	PlaySound(DWORD dwFlags);
	BOOL	StopSound();
	BOOL	CreateSoundBuffer(LPDIRECTSOUND lpDS, DWORD dwFlags, DWORD dwBufSize, DWORD dwFreq, DWORD dwBitsPerSample, DWORD dwBlkAlign, BOOL bStereo);
	BOOL	ReadData(FILE* pFile, DWORD dwSize, DWORD dwPos);
	BOOL	IsValid();
	LPDIRECTSOUNDBUFFER		GetBuffer() { return m_lpDSBuffer;}
	LPDIRECTSOUND3DBUFFER	Get3DBuffer() { return m_lpDS3DBuffer;}
};


#endif // !defined(AFX_DSBUFFER_H__7517D749_96E3_11D2_BBF3_9EB4940D843C__INCLUDED_)
