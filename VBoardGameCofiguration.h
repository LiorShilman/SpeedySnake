#if !defined(AFX_VBOARDGAMECOFIGURATION_H__AAEE7C03_0F51_11D3_AE58_D1A1DAC2D699__INCLUDED_)
#define AFX_VBOARDGAMECOFIGURATION_H__AAEE7C03_0F51_11D3_AE58_D1A1DAC2D699__INCLUDED_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000
// VBoardGameCofiguration.h : header file
//

/////////////////////////////////////////////////////////////////////////////
// VBoardGameCofiguration dialog

enum { MAXSPEED = 6};
enum { MINSPEED = 1};

class VBoardGameCofiguration : public CDialog
{
// Construction
public:
	VBoardGameCofiguration(CWnd* pParent = NULL);   // standard constructor

// Dialog Data
	//{{AFX_DATA(VBoardGameCofiguration)
	enum { IDD = IDD_CONFIGURATIONSANKEGAME };

	int		m_nSpeed;
	int		m_nLavel;
	//}}AFX_DATA


// Overrides
	// ClassWizard generated virtual function overrides
	//{{AFX_VIRTUAL(VBoardGameCofiguration)
	protected:
	virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support
	//}}AFX_VIRTUAL

// Implementation
protected:

	// Generated message map functions
	//{{AFX_MSG(VBoardGameCofiguration)
	virtual BOOL OnInitDialog();
	afx_msg void OnHScroll(UINT nSBCode, UINT nPos, CScrollBar* pScrollBar);
	afx_msg void OnFileNewGame();
	//}}AFX_MSG
	DECLARE_MESSAGE_MAP()
};

//{{AFX_INSERT_LOCATION}}
// Microsoft Visual C++ will insert additional declarations immediately before the previous line.

#endif // !defined(AFX_VBOARDGAMECOFIGURATION_H__AAEE7C03_0F51_11D3_AE58_D1A1DAC2D699__INCLUDED_)
