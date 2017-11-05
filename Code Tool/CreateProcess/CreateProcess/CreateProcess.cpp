// CreateProcess.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <windows.h>
#include <stdio.h>
#include <tchar.h>
#include "string"


int _tmain(int argc, _TCHAR* argv[])
{
	STARTUPINFOA si;
	PROCESS_INFORMATION pi;
	char szCmdLine[MAX_PATH] = {0};
	int i, min = 2, max;
	char cDirectory[MAX_PATH] = {0};
	char* cExt = NULL;

	ZeroMemory( &si, sizeof(si) );
	si.cb = sizeof(si);
	ZeroMemory( &pi, sizeof(pi) );

	char szCmd[MAX_PATH] = "node "; //E:\\PhanTan\\tong-hop\\Agent";

	GetCurrentDirectoryA(MAX_PATH, cDirectory);
	cExt = strrchr(cDirectory, '\\');
	cExt[1] = 0;

	strcat_s(szCmd, cDirectory);
	strcat_s(szCmd, "Agent");

	printf("\n%s\n", cDirectory);

	/*printf("\nNhap vao so i= ");
	scanf_s("%d", &i);

	if (i = 0)
	{
		min = 101;
		max = 201;
	}
	else
	{
		min = 201;
		max = 301;
	}*/

	while (min < 502)
	{
		sprintf_s(szCmdLine, MAX_PATH, "%s\\Agent%d.js", szCmd, min);
		//printf("\nCmd = %s", szCmdLine);
		if( !CreateProcessA(NULL,   // No module name (use command line)
			szCmdLine,        // Command line
			NULL,           // Process handle not inheritable
			NULL,           // Thread handle not inheritable
			FALSE,          // Set handle inheritance to FALSE
			0,              // No creation flags
			NULL,           // Use parent's environment block
			NULL,           // Use parent's starting directory 
			&si,            // Pointer to STARTUPINFO structure
			&pi )           // Pointer to PROCESS_INFORMATION structure
			) 
		{
			printf( "CreateProcess failed (%d).\n", GetLastError() );
			min++;
			continue;
		}
		min++;
	}

	

	CloseHandle( pi.hProcess );
	CloseHandle( pi.hThread );

	system("pause");
	return 0;
}

