///////////////////////////////////////////////////////////////////////////////
//                                                                           //
//                             DirectSound Mixer                             //
//                                                                           //
//                      V1.0 by lob_b@hotmail.com 1999                       //
//                                                                           //
//                           with core inputs from                           //
//                                 Stack-Up                                  //
//                    V1.0 © Tool@theWaterCooler.com 1998                    //
//                    http://www.theWaterCooler.com/Tool                     //
//                        also Petr.Stejskal@vslib.cz                        //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

// DSBuffer.cpp : Implementation of CDSBuffer class
//

#include "stdafx.h"
#include "DSBuffer.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
// CDSBuffer

CDSBuffer::CDSBuffer()
{
	// Reset the sound buffer
	m_lpDSBuffer = NULL;

	// Reset the 3D buffer
	m_lpDS3DBuffer = NULL;
}

CDSBuffer::CDSBuffer(const char *FileName, LPDIRECTSOUND lpDS, DWORD dwFlags)
{
	// Reset the sound buffer
	m_lpDSBuffer = NULL;

	// Reset the 3D buffer
	m_lpDS3DBuffer = NULL;

	// Open the wave file       
	FILE* pFile = fopen(FileName, "rb");
	if(!pFile)
		return;

	// Read in the wave header          
	WaveHeader wavHdr;
	if (fread(&wavHdr, sizeof(wavHdr), 1, pFile) != 1) 
	{
		fclose(pFile);
		return;
	}

	// Figure out the size of the data region
	DWORD dwSize = wavHdr.dwDSize;

	// Is this a stereo or mono file?
	BOOL bStereo = wavHdr.wChnls > 1 ? true : false;

	// Create the sound buffer for the wave file
	if(CreateSoundBuffer(lpDS, dwFlags, dwSize, wavHdr.dwSRate, wavHdr.BitsPerSample, wavHdr.wBlkAlign, bStereo))
	{
		// Read the data for the wave file into the sound buffer
		if (!ReadData(pFile, dwSize, sizeof(wavHdr)))
			AfxMessageBox("Error - DS - Reading Data");
		else if (dwFlags & DSBCAPS_CTRL3D)
		{
			// Get pointer to 3D buffer
			if (S_OK != m_lpDSBuffer->QueryInterface(IID_IDirectSound3DBuffer, (void **)&m_lpDS3DBuffer))
				AfxMessageBox("DirectSound3DBuffer not available");
		}
	}

	fclose(pFile);
}


CDSBuffer::~CDSBuffer()
{
	StopSound();
	if(m_lpDSBuffer)
	{       
		m_lpDSBuffer->Release();
	}

	if(m_lpDS3DBuffer)
	{       
		m_lpDS3DBuffer->Release();
	}
}


BOOL CDSBuffer::CreateSoundBuffer(LPDIRECTSOUND lpDS, DWORD dwFlags, DWORD dwBufSize, DWORD dwFreq, DWORD dwBitsPerSample, DWORD dwBlkAlign, BOOL bStereo)
{
	PCMWAVEFORMAT pcmwf;
	DSBUFFERDESC dsbdesc;

	// Set up wave format structure.
	memset( &pcmwf, 0, sizeof(PCMWAVEFORMAT) );
	pcmwf.wf.wFormatTag         = WAVE_FORMAT_PCM;      
	pcmwf.wf.nChannels          = bStereo ? 2 : 1;
	pcmwf.wf.nSamplesPerSec     = dwFreq;
	pcmwf.wf.nBlockAlign        = (WORD)dwBlkAlign;
	pcmwf.wf.nAvgBytesPerSec    = pcmwf.wf.nSamplesPerSec * pcmwf.wf.nBlockAlign;
	pcmwf.wBitsPerSample        = (WORD)dwBitsPerSample;

	// Set up DSBUFFERDESC structure.
	memset(&dsbdesc, 0, sizeof(DSBUFFERDESC));  // Zero it out. 
	dsbdesc.dwSize              = sizeof(DSBUFFERDESC);
	dsbdesc.dwFlags             = dwFlags;
	dsbdesc.dwBufferBytes       = dwBufSize; 
	dsbdesc.lpwfxFormat         = (LPWAVEFORMATEX)&pcmwf;

	if (DS_OK != lpDS->CreateSoundBuffer(&dsbdesc, &m_lpDSBuffer, NULL))
	{
		AfxMessageBox("Error - DS - CreateSoundBuffer");
		return FALSE;
	}

	return TRUE;
}


BOOL CDSBuffer::ReadData(FILE* pFile, DWORD dwSize, DWORD dwPos) 
{
	// Seek to correct position in file (if necessary)
	if (dwPos != 0xffffffff) 
	{
		if (fseek(pFile, dwPos, SEEK_SET) != 0) 
		{
			return FALSE;
		}
	}

	// Lock data in buffer for writing
	LPVOID pData1;
	DWORD  dwData1Size;
	LPVOID pData2;
	DWORD  dwData2Size;
	HRESULT rval;

	rval = m_lpDSBuffer->Lock(0, dwSize, &pData1, &dwData1Size, &pData2, &dwData2Size, DSBLOCK_FROMWRITECURSOR);
	if (rval != DS_OK)
	{
		return FALSE;
	}

	// Read in first chunk of data
	if (dwData1Size > 0) 
	{
		if (fread(pData1, dwData1Size, 1, pFile) != 1) 
		{               
			return FALSE;
		}
	}

	// read in second chunk if necessary
	if (dwData2Size > 0) 
	{
		if (fread(pData2, dwData2Size, 1, pFile) != 1) 
		{
			return FALSE;
		}
	}

	// Unlock data in buffer
	rval = m_lpDSBuffer->Unlock(pData1, dwData1Size, pData2, dwData2Size);
	if (rval != DS_OK)
	{
		return FALSE;
	}

	return TRUE;
}

BOOL CDSBuffer::PlaySound(DWORD dwFlags)
{
	if(m_lpDSBuffer)	// Make sure we have a valid sound buffer
	{
		DWORD dwStatus;
		if (DS_OK != m_lpDSBuffer->GetStatus(&dwStatus))
		{
			AfxMessageBox("Error - DS - GetStatus");
			return FALSE;
		}

		if((dwStatus & DSBSTATUS_PLAYING) != DSBSTATUS_PLAYING)
		{
			if (DS_OK != m_lpDSBuffer->Play(0, 0, dwFlags))		// Play the sound
			{
				AfxMessageBox("Error - DS - Play");
				return FALSE;
			}
		}
	}

	return TRUE;
}

BOOL CDSBuffer::StopSound()
{
	if(m_lpDSBuffer)	// Make sure we have a valid sound buffer
	{
		DWORD dwStatus;
		if (DS_OK != m_lpDSBuffer->GetStatus(&dwStatus))
		{
			AfxMessageBox("Error - DS - GetStatus");
			return FALSE;
		}

		if ((dwStatus & DSBSTATUS_PLAYING) == DSBSTATUS_PLAYING)
		{  
			if (DS_OK != m_lpDSBuffer->Stop())		// Stop the sound
			{
				AfxMessageBox("Error - DS - Stop");
					return FALSE;
			}

		}
	}
	return TRUE;
}


BOOL CDSBuffer::IsValid()
{
	if (m_lpDSBuffer)
		return TRUE;
	else
		return FALSE;
}


