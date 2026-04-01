// BoardSpeedySnakeView.h : interface of the CBoardSpeedySnakeView class
//
/////////////////////////////////////////////////////////////////////////////

#if !defined(AFX_BOARDSPEEDYSNAKEVIEW_H__77E7684D_0EB5_11D3_AE58_CA784773621A__INCLUDED_)
#define AFX_BOARDSPEEDYSNAKEVIEW_H__77E7684D_0EB5_11D3_AE58_CA784773621A__INCLUDED_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000

//#include "AllLavel.h"
#include "SpeedySnakeHighScore.h"
#include "PlayerNameDialog.h"

#define LIGHT_BLUE_BRUSH RGB(0,0,160)
#define DS_SOUNDS_NUM 1


class CBoardSpeedySnakeView : public CScrollView
{
	#define DS_CHECK_ERROR(ErrorMessage) { if(g_DX_Result != DS_OK) { AfxMessageBox(ErrorMessage); return false; } }
protected:
	CBoardSpeedySnakeView();
	DECLARE_DYNCREATE(CBoardSpeedySnakeView)// create from serialization only

	CDC * m_pdcMemory;
	CBitmap *m_pbBoard;
	CBitmap *m_pbToDraw;
	char *   m_cWavFire;
	HBRUSH  hLightBlue;
// Attributes
public:
	CBoardSpeedySnakeDoc*  GetDocument();
	VBoardGameCofiguration DlgGameConfiguration;
	SpeedySnakeHighScore   DlgHighScore;
	CPlayerNameDialog      DlgPlayerName;
	BOOL InGame;
	BOOL AfterKeyUp;
	BOOL AfterCtrlUp;
	LPDIRECTSOUNDBUFFER   m_lpDS_Sounds[DS_SOUNDS_NUM];         // Sound buffers
	HRESULT g_DX_Result;
	LPDIRECTSOUND         g_lpDS;


    bool   DS_Init();
    void   DS_Finish();
    bool   DS_StopAllSounds();
    bool   DS_CreateBufferFromWaveFile(char* FileName, DWORD dwBuf);
    bool   DS_PlaySound(int nSound, DWORD dwFlags);
    bool   DS_CreateSoundBuffer(DWORD dwBuf, DWORD dwBufSize, DWORD dwFreq, DWORD dwBitsPerSample, DWORD dwBlkAlign, BOOL bStereo);
    bool   DS_ReadData(LPDIRECTSOUNDBUFFER lpDSB, FILE* pFile, DWORD dwSize, DWORD dwPos);

// Operations
public:

// Overrides
	// ClassWizard generated virtual function overrides
	//{{AFX_VIRTUAL(CBoardSpeedySnakeView)
	public:
	virtual void OnDraw(CDC* pDC);  // overridden to draw this view
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);
	protected:
	virtual void OnInitialUpdate(); // called first time after construct
	//}}AFX_VIRTUAL

// Implementation
public:
	void SaveScoreInReg();
	void InitFromSaveFile(FILE * TSaveFile);
	void PrintToFile(FILE * TFile);
	void SetGameTimer(int Timer);
	void InitMoveInBoard(CPoint Direction);
	void InitOneLavel(CString Lavel);
	void InitLavel();
	virtual ~CBoardSpeedySnakeView();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

protected:

// Generated message map functions
protected:
	//{{AFX_MSG(CBoardSpeedySnakeView)
	afx_msg void OnPaint();
	afx_msg void OnKeyDown(UINT nChar, UINT nRepCnt, UINT nFlags);
	afx_msg void OnTimer(UINT nIDEvent);
	afx_msg void OnFileNewGame();
	afx_msg void OnKeyUp(UINT nChar, UINT nRepCnt, UINT nFlags);
	afx_msg void OnFileSaveGame();
	afx_msg void OnFileOpenSaveGame();
	afx_msg void OnLoadHighscore();
	//}}AFX_MSG
	DECLARE_MESSAGE_MAP()
};

#ifndef _DEBUG  // debug version in BoardSpeedySnakeView.cpp
inline CBoardSpeedySnakeDoc* CBoardSpeedySnakeView::GetDocument()
   { return (CBoardSpeedySnakeDoc*)m_pDocument; }
#endif

/////////////////////////////////////////////////////////////////////////////

//{{AFX_INSERT_LOCATION}}
// Microsoft Visual C++ will insert additional declarations immediately before the previous line.

#endif // !defined(AFX_BOARDSPEEDYSNAKEVIEW_H__77E7684D_0EB5_11D3_AE58_CA784773621A__INCLUDED_)
